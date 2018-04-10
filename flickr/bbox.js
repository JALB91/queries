export default class bbox {
    constructor(sLat, sLon, eLat, eLon, section = 1.0) {
        this.sLat = sLat;
        this.sLon = sLon;
        this.eLat = eLat;
        this.eLon = eLon;

        this.insideSection = null;

        this.section = section;
        this.distLat = this.round((this.eLat - this.sLat) * this.section);
        this.distLon = this.round((this.eLon - this.sLon) * this.section);
        this.x = 0;
        this.y = 0;

        this.currentSLat = this.sLat;
        this.currentSLon = this.sLon;
        this.currentELat = this.round(this.currentSLat + this.distLat);
        this.currentELon = this.round(this.currentSLon + this.distLon);

        this.ended = false;
    }

    round(number) {
        return Math.round(number * Math.pow(10, 20)) / Math.pow(10, 20);
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
            this.insideSection = null;
            this.goToNextSection();
            result = this.isEnded();
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
                this.ended = true;
                return;
            }
            this.x = 0;
            this.y++;
        } else {
            this.x++;
        }


        this.currentSLat = this.round(this.sLat + (this.distLat * this.x));
        this.currentSLon = this.round(this.sLon + (this.distLon * this.y));
        this.currentELat = this.round(this.currentSLat + this.distLat);
        this.currentELon = this.round(this.currentSLon + this.distLon);
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

    getDebugString() {
        if (this.insideSection) {
            return this.insideSection.getDebugString();
        } else {
            return `x1: ${this.currentSLat}, x2: ${this.currentELat} | y1: ${this.currentSLon}, y2: ${this.currentELon}`;
        }
    }

    isEnded() {
        return (!this.insideSection && this.ended);
    }
}