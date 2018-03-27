/*
    0.0, 0.0, 1.0, 1.0
    0.0, 0.0, 0.5, 0.5
    0.5, 0.0, 1.0, 0.5
    0.0, 0.5, 0.5, 1.0
    0.5, 0.5, 1.0, 1.0
    0.0, 0.0, 1.0, 1.0
*/

export default class bbox {
    constructor(sLat, sLon, eLat, eLon, section = 1.0) {
        this.sLat = sLat;
        this.sLon = sLon;
        this.eLat = eLat;
        this.eLon = eLon;

        this.insideSection = null;

        this.section = section;
        this.distLat = this.roundSix((this.eLat - this.sLat) * this.section);
        this.distLon = this.roundSix((this.eLon - this.sLon) * this.section);
        this.x = 0;
        this.y = 0;

        this.currentSLat = this.sLat;
        this.currentSLon = this.sLon;
        this.currentELat = this.roundSix(this.currentSLat + this.distLat);
        this.currentELon = this.roundSix(this.currentSLon + this.distLon);

        console.log('ADD');
        // console.log(`From: ${this.currentSLat}, ${this.currentSLon} ----- To: ${this.currentELat}, ${this.currentELon}`);
    }

    roundSix(number) {
        return Math.round(number * Math.pow(10, 6)) / Math.pow(10, 6);
    }

    addSection() {
        if (this.insideSection) {
            this.insideSection.addSection();
        } else {
            this.insideSection = new bbox(this.currentSLat, this.currentSLon, this.currentELat, this.currentELon, 0.5);
        }
    }

    removeSectionIfNeeded() {
        let result = this.isEnded();
        if (this.insideSection && this.insideSection.removeSectionIfNeeded()) {
            console.log('REMOVE');
            this.insideSection = null;
            result = this.isEnded();
            this.goToNextSection();
        }
        return result;
    }

    goToNextSection() {
        if (this.insideSection) {
            this.insideSection.goToNextSection();
            return;
        }

        if (Math.abs(this.currentELat - this.eLat) < this.distLat * 0.5) {
            if (Math.abs(this.currentELon - this.eLon) < this.distLon * 0.5) {
                return;
            }
            this.x = 0;
            this.y++;
        } else {
            this.x++;
        }

        console.log('NEXT');
        
        this.currentSLat = this.roundSix(this.sLat + (this.distLat * this.x));
        this.currentSLon = this.roundSix(this.sLon + (this.distLon * this.y));
        this.currentELat = this.roundSix(this.currentSLat + this.distLat);
        this.currentELon = this.roundSix(this.currentSLon + this.distLon);
    }

    getCurrentSection() {
        if (this.insideSection) {
            return this.insideSection.getCurrentSection();
        } else {
            return this;
        }
    }

    getString() {
        if (this.insideSection) {
            return this.insideSection.getString();
        } else {
            return `${this.currentSLat}, ${this.currentSLon}, ${this.currentELat}, ${this.currentELon}`;
        }
    }

    isEnded() {
        return (!this.insideSection && 
            Math.abs(this.currentELat - this.eLat) < this.distLat * 0.5 && 
            Math.abs(this.currentELon - this.eLon) < this.distLon * 0.5);
    }
}