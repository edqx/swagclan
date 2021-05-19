import {
    prop,
    getModelForClass,
    ModelOptions,
    Severity
} from "@typegoose/typegoose";

@ModelOptions({
    schemaOptions: {
        collection: "errors",
        minimize: false
    },
    options: {
        allowMixed: Severity.ALLOW
    }
})
export class FatalError {
    @prop()
    uuid!: string;

    @prop()
    namespace!: string;

    @prop()
    error!: string;

    @prop()
    stack_trace?: string;

    @prop()
    details?: any;
}

export const FatalErrorModel = getModelForClass(FatalError);
