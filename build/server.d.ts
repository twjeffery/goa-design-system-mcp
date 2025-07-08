export declare class GoADesignSystemServer {
    private components;
    private systemFiles;
    private masterIndex;
    private initialized;
    initialize(): Promise<void>;
    private loadAllData;
    searchComponents(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    getComponentDetails(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    getUsagePatterns(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    collectFeedback(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
}
//# sourceMappingURL=server.d.ts.map