export class Locker<T extends string> {
  private locks = new Map<T, true>();

  lock = (lockType: T) => {
    this.locks.set(lockType, true);
  };

  
  unlock = (lockType: T) => {
    this.locks.delete(lockType);
    return !this.isLocked();
  };

  
  isLocked(lockType?: T) {
    return lockType ? this.locks.has(lockType) : !!this.locks.size;
  }
}
