
/** 
 * Object that contain the license information as defined in
 * https://spec.openapis.org/oas/v3.0.3.html#contactObject
 */
export interface ContactObject {
    name?: string,
    url?: string,
    email?: string
}

/** 
 * Object that contain the license information as defined in
 * https://spec.openapis.org/oas/v3.0.3.html#licenseObject
 */
export interface LicenseObject {
    name: string,
    url?: string
}

/** 
 * Object that contain the api information as defined in
 * https://spec.openapis.org/oas/v3.0.3.html#info-object
 */
export interface InfoObject {
    title?: string,
    description?: string,
    termsOfService?: string,
    contact?: ContactObject,
    license?: LicenseObject,
    version?: string,
}

/**
 * Object that contain the servers information as defined in
 * https://spec.openapis.org/oas/v3.0.3.html#server-object
 * field `variables`is not supported yet
 */
export interface ServerObject {
    url: string,
    description?: string
}

/**
 * Object that contain the servers information as defined in
 * https://spec.openapis.org/oas/v3.0.3.html#security-scheme-object
 */
export interface SecurityObject {
    type: 'http',
    description?: string,
    scheme: 'bearer' | 'basic',
    bearerFormat?: string
}

export interface AuthOptions {
    [key: string]: SecurityObject
}

/**
 * Object that contain the external docs information as defined in
 * https://spec.openapis.org/oas/v3.0.3.html#external-documentation-object
 */
export interface ExternalDocsObject {
    description?: string,
    url?: string
}

export interface FoldersOption {
    concat: boolean,
    separator: string
}

export interface DisabledParamsOptions {
    // Default to `false`
    includeQuery?: boolean,
    // Default to `false`
    includeHeader?: boolean
}

export interface Options {
    info?: InfoObject,
    defaultTag?: string,
    pathDepth?: number,
    auth?: AuthOptions,
    servers?: Array<ServerObject>,
    externalDocs?: ExternalDocsObject,
    folders?: FoldersOption,
    // Default value true
    responseHeaders?: boolean,
    // Default value false
    replaceVars?: boolean,
    additionalVars?: { [key: string]: string },
    // Default value 'yaml'
    outputFormat?: 'json' | 'yaml',
    disabledParams?: DisabledParamsOptions,
    // Default value 'off'
    operationId?: 'off' | 'auto' | 'brackets'
}

export default function postmanToOpenApi (input: string, output?: string, options?: Options) : Promise<string>
