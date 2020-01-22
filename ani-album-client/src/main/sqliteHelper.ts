import * as sqlite3 from 'sqlite3';
import { promisify } from 'util';

export class SQLiteHelperStmt {

  private _finalize: () => Promise<void>;

  constructor(private stmt: sqlite3.Statement) {
    this._finalize = promisify(stmt.finalize).bind(stmt);
  }

  run(...params: any[]): Promise<sqlite3.RunResult> {
    return new Promise((resolve, reject) => {
      this.stmt.run(...params, function (err: Error) {
        if (err) return reject(err);
        return resolve(this);
      })
    })
  }

  async finalize() {
    await this._finalize();
  }

}

export class SQLiteHelper {

  static async create(path: string): Promise<SQLiteHelper> {
    const helper = new SQLiteHelper(path);
    await helper.open();
    return helper;
  }

  private _db: sqlite3.Database;
  private _run: (sql: string) => Promise<void>
  private _get: (sql: string, ...params: any[]) => Promise<any>;

  private constructor(
    private path: string,
  ) {}

  private open(): Promise<void> {
    return new Promise((resolve, reject) => {
      this._db = new sqlite3.Database(this.path, (err: Error) => {
        if (err) return reject(err);
        this._run = promisify(this._db.run).bind(this._db);
        this._get = promisify(this._db.get).bind(this._db);
        return resolve();
      });
    });
  }

  async run(sql: string): Promise<void> {
    await this._run(sql);
  }

  async prepare(sql: string): Promise<SQLiteHelperStmt> {
    return new Promise((resolve, reject) => {
      const stmt: sqlite3.Statement = this._db.prepare(sql, (err: Error) => {
        if (err) return reject(err);
        return resolve(new SQLiteHelperStmt(stmt));
      });
    });
  }

  async get(sql: string, ...params: any[]): Promise<any> {
    return await this._get(sql, ...params);
  }

}
