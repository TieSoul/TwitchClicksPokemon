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

    Game.AllFossils = [];
    for (var name in TEAMANARCHY) {
        Game.AllFossils.push(name);
    }
    for (var name in TEAMDEMOCRACY) {
        Game.AllFossils.push(name);
    }

    Game.Upgrades = Game.Upgrades || UPGRADES;
    for (var name in UPGRADES) {
        var upgrade = Game.Upgrades[name] = Game.Upgrades[name] || UPGRADES[name];
        for (var attr in UPGRADES[name]) {
            upgrade[attr] = UPGRADES[name][attr];
        }
        upgrade.unlocked = upgrade.unlocked || false;
        upgrade.bought = upgrade.bought || false;
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
        if (Game.Upgrades[name]) {
            var upgrade = Game.Upgrades[name];
            return upgrade.price;
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
        if (JSON.stringify(cost) == '{}') return "- FREE <br>";
        var str = '';
        for (var rs in cost) {
            str += '- ' + beautify(cost[rs]) + ' ' + Game.Resources[rs].name + '<br>';
        }
        return str;
    };

    Game.updateResources();

    Game.updateFossils = function () {
        var anarchDiv = document.getElementById('teamanarchy');
        var str = '<b>Team Anarchy</b><br>';
        for (var anarchName in Game.TeamAnarchy) {
            var anarch = Game.TeamAnarchy[anarchName];
            if (anarch.unlocked) {
                str += '<div class="fossil">' +
                           '<b>' + anarch.name + '</b><br>' +
                           'Amount: ' + beautify(anarch.amount) + '<br>' +
                           Game.costToHTML(anarchName) +
                           '<a href="#" onclick="Game.buyFossil(\'' + anarchName + '\')">Buy</a><br>' +
                           beautify(Game.getRawProduction(anarchName)) + ' Inputs/s on average per ' + anarch.name + '<br>' +
                           anarch.desc +
                       '</div>';
            }
        }
        anarchDiv.innerHTML = str;
        var demochDiv = document.getElementById('teamdemocracy');
        str = '<b>Team Democracy</b><br>';
        for (var demochName in Game.TeamDemocracy) {
            var democh = Game.TeamDemocracy[demochName];
            if (democh.unlocked) {
                str += '<div class="fossil">' +
                    '<b>' + democh.name + '</b><br>' +
                    'Amount: ' + beautify(democh.amount) + '<br>' +
                    Game.costToHTML(demochName) +
                    '<a href="#" onclick="Game.buyFossil(\'' + demochName + '\')">Buy</a><br>' +
                    beautify(Game.getRawProduction(demochName)) + ' Inputs/30s on average per ' + democh.name + '<br>' +
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
        for (var upg in Game.Upgrades) {
            var upgrade = Game.Upgrades[upg];
            if (upgrade.onProductionMultiplier && upgrade.bought) {
                production *= upgrade.onProductionMultiplier(fossilName);
            }
        }

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

    Game.notify = function (notification) {
        $.notify(notification, {style: 'metro', className: 'black', position: "bottom right"})
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

    Game.donger = function () {
        var rand = Math.random();
        var dongerRewardText;
        if (rand < 0.4) {
            Game.awardTemp('start9');
            dongerRewardText = 'Start9: Multiplies Anarchy production by 6 for ' + Game.Upgrades['start9'].duration + ' seconds.';
        } else {
            dongerRewardText = 'Input Storm: Instant inputs! yay!';
            Game.AwardResource('inputs', Game.inputStormAmount());
        }
        Game.notify({title: 'ヽ༼ຈل͜ຈ༽ﾉ', text: 'Dongers gave you: ' + dongerRewardText});
        Game.updateEverything();
    };

    Game.getTotalProfit = function () {
        var p = 0;
        for (var i = 0; i < Game.AllFossils.length; i++) {
            var fossilName = Game.AllFossils[i];
            if (Game.TeamAnarchy[fossilName]) p += Game.getProduction(fossilName);
            else p += Game.getProduction(fossilName)/30;
        }
        return p;
    };

    Game.inputStormAmount = function () {
        return Game.getTotalProfit() * 300;
    };

    Game.awardTemp = function (temporaryUpgrade) {
        Game.Upgrades[temporaryUpgrade].unlocked = true;
        Game.Upgrades[temporaryUpgrade].bought = true;
        Game.Upgrades[temporaryUpgrade].time = Game.Upgrades[temporaryUpgrade].duration;
    };

    Game.updateEverything = function() {
        Game.updateFossils();
        Game.updateResources();
        Game.updateUpgrades();
    };

    Game.updateUpgrades = function() {
        var upgradeDiv = document.getElementById('upgradeshop');
        var s = "<b>Upgrade Shop</b><br>";
        for (var upgradeName in Game.Upgrades) {
            var upgrade = Game.Upgrades[upgradeName];
            if (upgrade.unlocked && !upgrade.bought) {
                s += "<div class=\"upgrade\">" +
                    "<b>" + upgrade.name + "</b><br>" +
                    (typeof(upgrade.desc) == "function" ? upgrade.desc() : upgrade.desc) + "<br>" +
                    Game.costToHTML(upgradeName) +
                    "<a href=\"#\" onclick=\"Game.buyUpgrade('" + upgradeName + "')\">Buy</a>" +
                    "</div>";
            }
        }
        if (s != upgradeDiv.innerHTML){
            upgradeDiv.innerHTML = s;
        }
    };

    Game.buyUpgrade = function(upgradeName) {
        if (Game.canAfford(upgradeName)) {
            var upgrade = Game.Upgrades[upgradeName];
            upgrade.bought = true;
            var cost = Game.getCost(upgradeName);
            for (var rs in cost) {
                Game.Resources[rs].amount -= cost[rs];
            }
            if (upgrade.onBuy) upgrade.onBuy();
        }
    };

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
        for (var upg in Game.Upgrades) {
            if (Game.Upgrades[upg].time && Game.Upgrades[upg].time > 0) {
                Game.Upgrades[upg].time -= dt / 1000;
                if (Game.Upgrades[upg].time <= 0) {
                    Game.Upgrades[upg].unlocked = false;
                    Game.Upgrades[upg].bought = false;
                    Game.notify({text: Game.Upgrades[upg].name + ' was locked.'});
                    Game.updateEverything();
                }
            }
            if (Game.Upgrades[upg].unlock && !Game.Upgrades[upg].unlocked) {
                Game.Upgrades[upg].unlocked = Game.Upgrades[upg].unlock();
            }
            if (Game.Upgrades[upg].onTick) Game.Upgrades[upg].onTick(dt);
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
        Game.updateUpgrades();
    };
}

function save () {
    localStorage.setItem('TwitchClicksPokemon', JSON.stringify(Game));
}

function load () {
    try {
        var loadgame = JSON.parse(localStorage.getItem('TwitchClicksPokemon'));
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
    setInterval(save, 20000);
    setInterval(Game.tick, 100);
};