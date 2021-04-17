export class LoggerUtil {
  static log(action: string, message: string) {
    console.log('\x1b[32m', `[${action}]:`, '\x1b[0m', message);
  }
}
