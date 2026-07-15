export type ProjectConfig = {
    slug: string;
    name: string;
};
export declare function getProjectConfig(cwd?: string): ProjectConfig | null;
export declare function saveProjectConfig(config: ProjectConfig, cwd?: string): void;
export declare function slugify(name: string): string;
//# sourceMappingURL=project.d.ts.map