import Homey from 'homey';

class Driver extends Homey.Driver {
    async onInit() {
        this.log('Driver has been initialized');
    }
}

export = Driver;
