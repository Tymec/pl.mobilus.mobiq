import { ZwaveDevice } from 'homey-zwavedriver';

class Device extends ZwaveDevice {
    async onNodeInit() {
        // this.enableDebug();
        // this.printNode();

        this.log('Device has been initialized');

        // Add windowcoverings_set capability if not already added
        if (!this.hasCapability('windowcoverings_set')) {
            await this.addCapability('windowcoverings_set').catch(this.error);
        }
        // Register windowcoverings_set capability
        this.registerCapability('windowcoverings_set', 'SWITCH_MULTILEVEL', {
            getOpts: {
                getOnStart: true,
                pollInterval: 'poll_interval',
                pollMultiplication: 60000,
            },
        });

        // Add alarm_contact capability if not already added
        if (!this.hasCapability('alarm_contact')) {
            await this.addCapability('alarm_contact').catch(this.error);
        }
        // Register alarm_contact capability
        this.registerCapability('alarm_contact', 'NOTIFICATION', {
            report: 'NOTIFICATION_REPORT',
            reportParser: (report) => {
                if (report && report['Notification Type'] === 'System') {
                    this.refreshCapabilityValue(
                        'windowcoverings_set',
                        'SWITCH_MULTILEVEL'
                    ).catch(this.error);

                    setTimeout(
                        async () => {
                            await this.setCapabilityValue(
                                'alarm_contact',
                                false
                            ).catch(this.error);
                        },
                        this.getSetting('alarm_reset_time') * 1000 * 60
                    );

                    return report['Event'] === 3;
                }
                return null;
            },
        });
        await this.setCapabilityValue('alarm_contact', false).catch(this.error);
    }
}

export = Device;
