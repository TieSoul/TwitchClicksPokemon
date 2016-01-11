Game = {};

function init() {
    Game.Resources = Game.Resources || {};
    for (var resourceName in RESOURCES) {
        var resource = Game.Resources[resourceName] = Game.Resources[resourceName] || {};
        for (var attr in RESOURCES[resourceName]) {
            resource[attr] = RESOURCES[resourceName][attr];
        }
        resource.amount = resource.amount || 0;
    }

    Game.TeamAnarchy = Game.TeamAnarchy || {};
    for (var name in TEAMANARCHY) {
        var anarch = Game.TeamAnarchy[name] = Game.TeamAnarchy[name] || {};
        for (var attr in TEAMANARCHY[name]) {
            anarch[attr] = TEAMANARCHY[name][attr];
        }
        anarch.amount = anarch.amount || 0;
    }

    Game.TeamDemocracy = Game.TeamDemocracy || {};
    for (var name in TEAMDEMOCRACY) {
        var democh = Game.TeamDemocracy[name] = Game.TeamDemocracy[name] || {};
        for (var attr in TEAMDEMOCRACY[name]) {
            democh[attr] = TEAMDEMOCRACY[name][attr];
        }
        democh.amount = democh.amount || 0;
    }

    Game.updateResources = function () {
        var resourceDiv = document.getElementById('resourceview');
        var str = '<h1>Resources</h1>';
        for (var resourceName in Game.Resources) {
            var resource = Game.Resources[resourceName];
            if (resource.unlocked) {
                str += resource.name + ": " + beautify(resource.amount) + '<br />';
            }
        }
        resourceDiv.innerHTML = str;
    };

    Game.getCost = function(name) {
        var fossil;
        if (Game.TeamAnarchy[name]) {
            fossil = Game.TeamAnarchy[name];
        } else if (Game.TeamDemocracy[name]) {
            fossil = Game.TeamDemocracy[name];
        }
        if (fossil) {
            var cost = {};
            for (var rs in fossil.baseCost) {
                cost[rs] = Math.floor(fossil.baseCost[rs] * Math.pow(1.1, fossil.amount));
            }
            return cost;
        }
    };

    Game.canAfford = function(name) {
        var cost = Game.getCost(name);
        for (var rs in cost) {
            if (Game.Resources[rs].amount < cost[rs]) return false;
        }
        return true;
    };

    Game.costToHTML = function(name) {
        var cost = Game.getCost(name);
        var str = '';
        for (var rs in cost) {
            str += '- ' + beautify(cost[rs]) + ' ' + Game.Resources[rs].name + '<br />';
        }
        return str;
    };

    Game.updateResources();

    Game.updateFossils = function () {
        var anarchDiv = document.getElementById('teamanarchy');
        var str = '';
        for (var anarchName in Game.TeamAnarchy) {
            var anarch = Game.TeamAnarchy[anarchName];
            if (anarch.unlocked) {
                str += '<div class="fossil">' +
                           '<b>' + anarch.name + '</b><br />' +
                           'Amount: ' + beautify(anarch.amount) + '<br />' +
                           Game.costToHTML(anarchName) +
                           '<a href="#" onclick="Game.buyFossil(\'' + anarchName + '\')">Buy</a><br />' +
                           Game.getRawProduction(anarchName) + ' Inputs/s on average per ' + anarch.name + '<br />' +
                           anarch.desc +
                       '</div>';
            }
        }
        anarchDiv.innerHTML = str;
        var demochDiv = document.getElementById('teamdemocracy');
        str = '';
        for (var demochName in Game.TeamDemocracy) {
            var democh = Game.TeamDemocracy[demochName];
            if (democh.unlocked) {
                str += '<div class="fossil">' +
                    '<b>' + democh.name + '</b><br />' +
                    'Amount: ' + beautify(democh.amount) + '<br />' +
                    Game.costToHTML(demochName) +
                    '<a href="#" onclick="Game.buyFossil(\'' + demochName + '\')">Buy</a><br />' +
                    Game.getRawProduction(demochName) + ' Inputs/30s on average per ' + democh.name + '<br />' +
                    democh.desc +
                    '</div>';
            }
        }
        demochDiv.innerHTML = str;
    };

    Game.getRawProduction = function (fossilName) {
        var fossil;
        if (Game.TeamAnarchy[fossilName]) {
            fossil = Game.TeamAnarchy[fossilName];
        } else {
            fossil = Game.TeamDemocracy[fossilName];
        }
        var production = fossil.baseIncome;

        return production;
    };

    Game.getProduction = function (fossilName) {
        var fossil;
        if (Game.TeamAnarchy[fossilName]) {
            fossil = Game.TeamAnarchy[fossilName];
        } else {
            fossil = Game.TeamDemocracy[fossilName];
        }
        return Game.getRawProduction(fossilName) * fossil.amount;
    };

    Game.updateFossils();

    Game.buyFossil = function (fossilName) {
        if (Game.canAfford(fossilName)) {
            var fossil;
            if (Game.TeamAnarchy[fossilName]) {
                fossil = Game.TeamAnarchy[fossilName];
            } else {
                fossil = Game.TeamDemocracy[fossilName];
            }
            var cost = Game.getCost(fossilName);
            for (var rs in cost) {
                Game.Resources[rs].amount -= cost[rs];
            }
            fossil.amount++;
        }
        Game.updateFossils();
        Game.updateResources();
    };

    Game.AwardResource = function (resourceName, amount) {
        Game.Resources[resourceName].amount += amount;
        if (Game.Resources[resourceName].amount <= 0) Game.Resources[resourceName].amount = 0;

        Game.updateResources();
    };

    Game.click = function () {
        Game.AwardResource('inputs', 1);
    };

    Game.lastUpdate = Date.now();
    Game.demoTimer = 30;

    Game.tick = function () {
        var now = Date.now();
        var dt = now - Game.lastUpdate;
        Game.lastUpdate = now;
        Game.demoTimer -= dt / 1000;
        if (Game.demoTimer <= 0) {
            Game.demoTimer = 30;
            for (var demoName in Game.TeamDemocracy) {
                Game.AwardResource('inputs', (Math.random() * 0.4 + 1) * Game.getProduction(demoName));
            }
        }

        var demoTimerDiv = document.getElementById('democracypayout');
        demoTimerDiv.innerHTML = 'Democracy payout in ' + Math.ceil(Game.demoTimer) + 's';

        for (var anarchName in Game.TeamAnarchy) {
            var mod;
            if (Math.random() < 0.8) {
                mod = 2.5;
            } else {
                mod = -5;
            }
            Game.AwardResource('inputs', Game.getProduction(anarchName) * (dt / 1000) * mod);
        }
    };
}

function save () {
    localStorage.setItem('TwitchClicksPokemon', btoa(JSON.stringify(Game)));
}

function load () {
    try {
        var loadgame = JSON.parse(atob(localStorage.getItem('TwitchClicksPokemon')));
    } catch (e) {
        // do nothing
    }
    if (loadgame) {
        Game = loadgame;
    }
}

function beautify (num) {
    return Math.round(num * 100)/100; // will actually make numbers prettier soon.
}

window.onload = function () {
    load();
    init();
    setInterval(save, 2000);
    setInterval(Game.tick, 100)
};