export declare class OptimizedGoADesignSystemServer {
    private dataManager;
    private initialized;
    private extractGoAComponents;
    private getComponentDescription;
    private extractAndDescribeComponents;
    private enhanceResponseWithComponents;
    initialize(): Promise<void>;
    projectKnowledgeSearch(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
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
    giveFeedback(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
}
//# sourceMappingURL=optimized-server.d.ts.map