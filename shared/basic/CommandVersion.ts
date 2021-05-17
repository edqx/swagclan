export interface ScApiBasicCommandConfigDecl {
    name: string;
    description: string;
    type: string;
    initial?: any;
}

export interface ScApiBasicCommandParam {
    name: string;
    description: string;
    type: string;
    required: boolean;
}

export interface ScApiBasicCommandVariable {
    name: string;
    type: string;
}

export interface ScApiBasicCommandField {
    type: string;
    id: string;
}

export interface ScApiBasicCommandAction {
    type: string;
    rule: string;
    parent?: string;
    next?: string;
    fields: Record<string, ScApiBasicCommandField>;
}

export interface ScApiBasicCommandVersion {
    command_id: string;
    version: string;
    trigger: string;
    config: Record<string, ScApiBasicCommandConfigDecl>;
    params: ScApiBasicCommandParam[];
    variables: Record<string, ScApiBasicCommandVariable>;
    actions: Record<string, ScApiBasicCommandAction>;
    first: string;
}
