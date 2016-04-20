RESOURCES = {
    inputs: {
        name: 'Inputs',
        unlocked: true
    }
};

TEAMANARCHY = {
    helix: {
        name: 'Helix Fossil',
        desc: 'Praise. Generates inputs through sheer anarchy.',
        baseIncome: 0.1,
        baseCost: {
            'inputs': 10
        },
        unlocked: true
    }
};

TEAMDEMOCRACY = {
    dome: {
        name: 'Dome Fossil',
        desc: 'Praise this too. Slowly. It generates inputs by democratically voting.',
        baseIncome: 5,
        baseCost: {
            'inputs': 40
        },
        unlocked: true
    }
};

UPGRADES = {
    dongers: {
        name: 'Dongers',
        currentSecond: new Date().getSeconds(),
        song: ['I like to raise my Donger I do it all the time ヽ༼ຈل͜ຈ༽ﾉ',
               'and every time its lowered┌༼ຈل͜ຈ༽┐',
               'I cry and start to whine ┌༼@ل͜@༽┐',
               'But never need to worry ༼ ºل͟º༽',
               "my Donger's staying strong ヽ༼ຈل͜ຈ༽ﾉ",
               'A Donger saved is a Donger earned so sing the Donger song!'],
        line: 0,
        unlocktime: 200,
        unlockcounter: 200,
        desc: function() {
            var s = new Date().getSeconds();
            if (this.currentSecond !== s) {
                this.line = (this.line + 1) % this.song.length;
                this.currentSecond = s;
            }
            return this.song[this.line];
        },
        onTick: function (dt) {
            if (this.unlockcounter > 0) this.unlockcounter -= dt/1000;
        },
        unlock: function () {
            return this.unlockcounter <= 0;
        },
        price: {},
        onBuy: function () {
            Game.donger();
            this.unlocked = false;
            this.bought = false;
            this.unlockcounter = this.unlocktime;
        }
    },
    start9: {
        name: 'Start9',
        onProductionMultiplier: function (fossilName) {
            if (Game.TeamAnarchy[fossilName]) {
                return 6;
            }
            return 1;
        },
        duration: 10
    }
};