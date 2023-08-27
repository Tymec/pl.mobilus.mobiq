import { ZwaveDevice } from 'homey-zwavedriver';

class Device extends ZwaveDevice {
    async onNodeInit() {
        this.enableDebug();
        // this.printNode();

        this.log('Device has been initialized');

        // DEVICE_RESET_LOCALLY_NOTIFICATION
        this.registerCapability('windowcoverings_set', 'SWITCH_MULTILEVEL');
        this.registerCapability('windowcoverings_state', 'SWITCH_BINARY');
        this.registerCapability('windowcoverings_closed', 'SWITCH_BINARY', {
            get: 'SWITCH_BINARY_GET',
            getOpts: {
                getOnOnline: true,
                getOnStart: true,
            },
            set: 'SWITCH_BINARY_SET',
            setParser: (value: any) => {
                this.log('setParser', value);
                return {
                    'Switch Value': value ? 'on/enable' : 'off/disable',
                };
            },
            report: 'SWITCH_BINARY_REPORT',
            reportParser: (report: any) => {
                this.log('reportParser', report);
                return report['Value'] === 'on/enable';
            },
        });

        // this.registerCapability('windowcoverings_set', 'SWITCH_MULTILEVEL', {
        //     get: 'SWITCH_MULTILEVEL_GET',
        //     getParser: (value: any) => {
        //         this.log('getParser', value);
        //         return value;
        //     },
        //     set: 'SWITCH_MULTILEVEL_SET',
        //     setParser: (value: any) => {
        //         this.log('setParser', value);
        //         return {
        //             Value: value,
        //             'Dimming Duration': 0,
        //         };
        //     },
        //     report: 'SWITCH_MULTILEVEL_REPORT',
        //     reportParser: (report: any) => {
        //         this.log('reportParser', report);
        //         return report['Value (Raw)'][0];
        //     },
        // });

        this.registerCapability('alarm_contact', 'NOTIFICATION');
    }

    async onSettings({
        oldSettings,
        newSettings,
        changedKeys,
    }: {
        oldSettings: {
            [key: string]: string | number | boolean | null | undefined;
        };
        newSettings: {
            [key: string]: string | number | boolean | null | undefined;
        };
        changedKeys: string[];
    }): Promise<string | void> {
        this.log('onSettings', oldSettings, newSettings, changedKeys);

        if (changedKeys.includes('switch_all')) {
            this.log('switch_all', newSettings.switch_all);
        } else if (changedKeys.includes('reset_behaviour')) {
            this.log('reset_behaviour', newSettings.reset_behaviour);
        } else if (changedKeys.includes('motor_state')) {
            this.log('motor_state', newSettings.motor_state);
        }

        // throw new Error('Not implemented yet');
    }
}

export = Device;
