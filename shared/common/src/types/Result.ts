/**
 * Result type for handling success/error cases without exceptions
 */
export class Result<T> {
  private constructor(
    private readonly _isSuccess: boolean,
    private readonly _data?: T,
    private readonly _error?: string,
    private readonly _errorDetails?: Record<string, any>
  ) {}

  public get isSuccess(): boolean {
    return this._isSuccess;
  }

  public get isFailure(): boolean {
    return !this._isSuccess;
  }

  public get data(): T {
    if (!this._isSuccess) {
      throw new Error('Cannot access data from a failed result');
    }
    return this._data!;
  }

  public get error(): string {
    if (this._isSuccess) {
      throw new Error('Cannot access error from a successful result');
    }
    return this._error!;
  }

  public get errorDetails(): Record<string, any> | undefined {
    return this._errorDetails;
  }

  public static success<T>(data: T): Result<T> {
    return new Result<T>(true, data);
  }

  public static failure<T>(error: string, errorDetails?: Record<string, any>): Result<T> {
    return new Result<T>(false, undefined, error, errorDetails);
  }

  public map<U>(fn: (data: T) => U): Result<U> {
    if (this._isSuccess) {
      try {
        return Result.success(fn(this._data!));
      } catch (error) {
        return Result.failure(`Mapping failed: ${error}`);
      }
    }
    return Result.failure<U>(this._error!, this._errorDetails);
  }

  public flatMap<U>(fn: (data: T) => Result<U>): Result<U> {
    if (this._isSuccess) {
      return fn(this._data!);
    }
    return Result.failure<U>(this._error!, this._errorDetails);
  }

  public match<U>(
    onSuccess: (data: T) => U,
    onFailure: (error: string, details?: Record<string, any>) => U
  ): U {
    if (this._isSuccess) {
      return onSuccess(this._data!);
    }
    return onFailure(this._error!, this._errorDetails);
  }

  public unwrapOr(defaultValue: T): T {
    return this._isSuccess ? this._data! : defaultValue;
  }

  public unwrapOrThrow(): T {
    if (this._isSuccess) {
      return this._data!;
    }
    throw new Error(this._error!);
  }
}