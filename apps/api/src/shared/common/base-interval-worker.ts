import { Logger } from '@nestjs/common';

export abstract class BaseIntervalWorker {
  protected logger = new Logger(this.constructor.name);
  protected _isStarted = false;
  protected _nextTickTimer = 30000;
  protected _processingTimeout = 300000;

  public start(): void {
    if (this._isStarted) {
      this.logger.warn(`Trying to start processor twice: ${this.constructor.name}`);
      return;
    }

    this._isStarted = true;

    this.prepare()
      .then(() => {
        this.logger.log(`${this.constructor.name} finished preparing. Starting first tick...`);
        this.onTick();
      })
      .catch((err) => {
        throw err;
      });
  }

  public getNextTickTimer(): number {
    return this._nextTickTimer;
  }

  protected setNextTickTimer(timeout: number): void {
    this._nextTickTimer = timeout;
  }

  protected setProcessingTimeout(timeout: number): void {
    this._processingTimeout = timeout;
  }

  protected onTick(): void {
    const duration = this._processingTimeout;
    const classname = this.constructor.name;
    const timer = setTimeout(() => {
      this.logger.error(`${classname}::onTick timeout (${duration}ms) exceeded. Stopping worker.`);
      this._isStarted = false;
    }, duration);

    this.doProcess()
      .then(() => {
        clearTimeout(timer);
        setTimeout(() => this.onTick(), this.getNextTickTimer());
      })
      .catch((err) => {
        clearTimeout(timer);
        this.logger.error(`${classname} error: ${err.message}. Retrying...`);
        setTimeout(() => this.onTick(), this.getNextTickTimer());
      });
  }

  protected abstract prepare(): Promise<void>;
  protected abstract doProcess(): Promise<void>;
}
