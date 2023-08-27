declare module 'homey-zwavedriver' {
    import Homey from 'homey';

    /**
     * @classdesc
     * Extends {@link https://apps-sdk-v3.developer.homey.app/Device.html Homey.Device}
     *
     * {@link https://apps.developer.homey.app/the-basics/devices/settings Device settings} used by
     * system capabilities:
     * - `invertWindowCoveringsDirection` type `checkbox`, Used by several windowcoverings capabilities,
     *    if true it will invert the up/down direction
     * - `invertWindowCoveringsTiltDirection` type `checkbox`, Used by several windowcoverings
     *    capabilities, if true it will invert the tilt direction
     * @hideconstructor
     */
    export class ZwaveDevice extends Homey.Device {
        /**
         * This method can be overridden. It will be called when the {@link ZwaveDevice} instance is
         * ready and did initialize a {@link Homey.ZwaveNode}.
         * @param node
         * @abstract
         *
         * @example
         * const { ZwaveDevice } = require('homey-zwavedriver');
         *
         * class MyZwaveDevice extends ZwaveDevice {
         *   onNodeInit({ node }) {
         *
         *     // `node` is also available as `this.node` on the ZwaveDevice instance after
         *     // `onNodeInit` has been invoked.
         *     await node.CommandClass.COMMAND_CLASS_BASIC.BASIC_SET({ "Value": true });
         *   }
         * }
         */
        async onNodeInit({ node }: { node: Homey.ZwaveNode }): Promise<void>;

        /**
         * deprecated since v1.0.0 - Legacy from homey-meshdriver, use {@link onNodeInit} instead.
         * This method can be overridden. It will be called when the {@link ZwaveDevice} instance is
         * ready and did initialize a {@link Homey.ZwaveNode}.
         * @abstract
         */
        async onMeshInit(): Promise<void>;

        /**
         * @private
         */
        async onInit(): Promise<void>;

        /**
         * Remove all listeners and timeouts from node
         */
        async onDeleted(): Promise<void>;

        /**
         * Method that handles changing settings for Z-Wave devices. It iterates over the changed
         * settings and executes a CONFIGURATION_SET in sync. If all succeed, it will resolve, if one
         * or more fail it will reject with an error of concatenated error messages (to see which
         * settings failed if more than one).
         * @param oldSettings
         * @param newSettings
         * @param changedKeys
         */
        async onSettings({
            oldSettings,
            newSettings,
            changedKeys = [],
        }: {
            oldSettings: {
                [key: string]: boolean | string | number | undefined | null;
            };
            newSettings: {
                [key: string]: boolean | string | number | undefined | null;
            };
            changedKeys: string[];
        }): Promise<string | void>;

        /**
         * Register a Homey Capability with a Command Class.
         * Multiple `parser` methods can be provided by appending a version, e.g. `getParserV3`. This
         * will make sure that the highest matching version will be used, falling back to `getParser`.
         * @param capabilityId - The Homey capability id (e.g. `onoff`)
         * @param commandClassId - The command class id (e.g. `BASIC`)
         * @param userOpts - The object with options for this capability/commandclass
         * combination. These will extend system options, if available (`/system/`).
         */
        registerCapability(
            capabilityId: string,
            commandClassId: string,
            userOpts: {
                get?: string;
                getParser?: (value: number | boolean | string) => any;
                getOpts?: {
                    getOnStart?: boolean;
                    getOnOnline?: boolean;
                    pollInterval?: number | string;
                    pollMultiplication?: number;
                };
                set?: string;
                setParser?: (
                    value: number | boolean | string,
                    opts: any
                ) => any;
                setOpts?: {
                    fn?: (
                        value?: number | boolean | string,
                        opts?: any
                    ) => Promise<void>;
                };
                report?: string;
                reportParserOverride?: boolean;
                reportParser?: (report?: {
                    [key: string]: number | boolean | string | object;
                }) => any;
                multiChannelNodeId?: number;
            } = {}
        ): void;

        /**
         * Register a setting parser, which is called when a setting has changed. This is only needed
         * for Z-Wave settings, which directly map between a Homey setting and a Z-Wave parameter.
         * @param settingId - The setting ID, as specified in `/app.json`
         * @param parserFn - The function to call when the setting has changed
         */
        registerSetting(
            settingId: string,
            parserFn: (
                value: number | boolean | string | object,
                zwaveObj: object
            ) => Buffer | number | boolean
        ): void;

        /**
         * Register a report listener, which is called when a report has been received.
         * @param commandClassId - The ID of the Command Class (e.g. `BASIC`)
         * @param commandId - The ID of the Command (e.g. `BASIC_REPORT`)
         * @param triggerFn - The function to call when the report is received
         */
        registerReportListener(
            commandClassId: string,
            commandId: string,
            triggerFn: (report: {
                [key: string]: number | boolean | string | object;
            }) => void
        ): void;

        /**
         * Register a multi channel report listener, which is called when a report has been received.
         * @param multiChannelNodeId - The multi channel node id
         * @param commandClassId - The ID of the Command Class (e.g. `BASIC`)
         * @param commandId - The ID of the Command (e.g. `BASIC_REPORT`)
         * @param triggerFn - The function to call when the report is received
         */
        registerMultiChannelReportListener(
            multiChannelNodeId: number,
            commandClassId: string,
            commandId: string,
            triggerFn: (report: any) => void
        ): void;

        /**
         * Method that will check if the node has the provided command class
         * @param commandClassId - For example: SWITCH_BINARY
         * @param opts
         * @param opts.multiChannelNodeId - Multi channel node id to check for command class
         */
        hasCommandClass(
            commandClassId: string,
            opts: { multiChannelNodeId: number } = {}
        ): boolean;

        /**
         * Method that gets a CommandClass object by commandClassId. Optionally, it can get the object
         * on a multichannel node if the multiChannelNodeId is provided.
         * @param commandClassId
         * @param opts
         * @param opts.multiChannelNodeId - Provide this id if the command class should be
         * located on a mc node.
         */
        getCommandClass(
            commandClassId: string,
            opts: { multiChannelNodeId: number } = {}
        ): Error | boolean | any;

        /**
         * Method that gets all multi channel node ids that have a specific deviceClassGeneric.
         * @param deviceClassGeneric
         */
        getMultiChannelNodeIdsByDeviceClassGeneric(
            deviceClassGeneric: string
        ): number[];

        /**
         * This method executes the capability set command for a given capability/commandClass
         * combination. The capability and commandClass must be registered before this method is called.
         * @param capabilityId
         * @param commandClassId
         * @param value - the capability value to set (e.g 0 - 1 for dim)
         * @param opts - capability options object
         */
        async executeCapabilitySetCommand(
            capabilityId: string,
            commandClassId: string,
            value: number | boolean | string,
            opts: object = {}
        ): Promise<any>;

        /**
         * Method that resets the accumulated power meter value on the node. It tries to find the root
         * node of the device and then looks for the COMMAND_CLASS_METER.
         * @param multiChannelNodeId - define the multi channel node id in case the
         * COMMAND_CLASS_METER is on a multi channel node.
         */
        async meterReset({
            multiChannelNodeId,
        }: { multiChannelNodeId?: number } = {}): Promise<any>;

        /**
         * Wrapper for CONFIGURATION_SET. Provide options.id and/or options.index and options.size. By
         * default options.useSettingParser is true, then the value will first be parsed by the
         * registered setting parser or the system parser before sending. It will only be able to use
         * the registered setting parser if options.id is provided.
         * @param options
         * @param options.index
         * @param options.size
         * @param options.id
         * @param [options.signed]
         * @param [options.useSettingParser=true]
         * @param value
         */
        async configurationSet(
            options: {
                index: number;
                size: number;
                id: number;
                signed?: boolean;
                useSettingParser?: boolean;
            } = {},
            value: any
        ): Promise<any>;

        /**
         * Method that retrieves the value of a configuration parameter from the node.
         * @param options
         * @param options.index - Parameter index
         */
        async configurationGet(options: { index: number } = {}): any;

        /**
         * Method that flattens possibly nested settings and returns a flat settings array.
         */
        getManifestSettings(): any[];

        /**
         * Get a specific setting object from the manifest
         * @param id - Setting id to retrieve
         */
        getManifestSetting(id: string): object | Error;

        /**
         * Method that refreshes the capability value once. If you want to poll this value please use
         * the parameter getOpts.pollInterval at {@link ZwaveDevice#registerCapability}
         * @param capabilityId - The string id of the Homey capability
         * @param commandClassId - The Z-Wave command class used for this request
         */
        async refreshCapabilityValue(
            capabilityId: string,
            commandClassId: string
        ): Promise<any>;

        /**
         * Prints oneliner node summary, e.g. firmware information and device identifiers.
         */
        printNodeSummary(): void;

        /**
         * Print the current Node information with Command Classes and their versions
         */
        printNode(): void;

        /**
         * Enable debug logging on this device. Logs all incoming reports.
         */
        enableDebug(): void;
    }

    export class ZwaveLightDevice extends ZwaveDevice {
        onNodeInit(): Promise<void>;
    }
}
