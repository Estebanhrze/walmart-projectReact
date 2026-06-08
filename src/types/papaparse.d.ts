declare module 'papaparse' {
  export type ParseError = {
    code: string
    message: string
    row?: number
    type: string
  }

  export type ParseResult<T> = {
    data: T[]
    errors: ParseError[]
    meta: unknown
  }

  type ParseConfig<T> = {
    complete?: (result: ParseResult<T>) => void
    dynamicTyping?: boolean
    error?: (error: Error) => void
    header?: boolean
    skipEmptyLines?: boolean
  }

  const Papa: {
    parse<T>(input: string, config: ParseConfig<T>): void
  }

  export default Papa
}
