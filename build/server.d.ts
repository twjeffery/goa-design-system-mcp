export declare class GoADesignSystemServer {
    private components;
    private systemFiles;
    private workflows;
    private masterIndex;
    private initialized;
    private extractGoAComponents;
    private getComponentDescription;
    private extractAndDescribeComponents;
    private enhanceResponseWithComponents;
    initialize(): Promise<void>;
    private loadAllData;
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
    private storeFeedback;
    getFeedback(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    getFeedbackSummary(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    designReview(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    recommendPatterns(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    accessibilityAudit(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    governanceCheck(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
    teamOnboarding(args: any): Promise<{
        content: {
            type: string;
            text: string;
        }[];
    }>;
}
//# sourceMappingURL=server.d.ts.map