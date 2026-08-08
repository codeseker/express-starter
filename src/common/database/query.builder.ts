import { Model, QueryFilter, Types } from "mongoose";
import { ErrorResponse } from "../response/ErrorResponse";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

type PopulateKeys<T> = {
  [K in keyof T]: T[K] extends Types.ObjectId | Types.ObjectId[] ? K : never;
}[keyof T];

/**
 * Override the type of a populated field.
 * @example Populated<UserDocument, "roleId", IRole>
 * => UserDocument with roleId typed as IRole instead of Types.ObjectId
 */
export type Populated<T, K extends keyof T, R> = Omit<T, K> & Record<K, R>;

export class QueryBuilder<T> {
  private queryFilter: QueryFilter<T> = {};
  private populateOptions: Array<{ path: string; select?: string }> = [];
  private selectFields?: string | Record<string, number>;
  private sortOptions?: string | Record<string, 1 | -1>;
  private paginationParams?: { page: number; limit: number };
  private id?: string | Types.ObjectId;

  constructor(private readonly model: Model<T>) {}

  filter(filter: QueryFilter<T>): this {
    this.queryFilter = { ...this.queryFilter, ...filter };
    return this;
  }

  byId(id: string | Types.ObjectId): this {
    this.id = id;

    return this;
  }

  populate<K extends PopulateKeys<T>>(path: K, select?: string): this {
    this.populateOptions.push({
      path: path as string,
      select,
    });

    return this;
  }

  select(fields: string | Record<string, number>): this {
    this.selectFields = fields;
    return this;
  }

  sort(sort: string | Record<string, 1 | -1>): this {
    this.sortOptions = sort;
    return this;
  }

  paginate(page: number, limit: number): this {
    this.paginationParams = {
      page: Math.max(1, page),
      limit: Math.max(1, limit),
    };
    return this;
  }

  async executeOne<TResult = T>(): Promise<TResult | null> {
    const query = this.id
      ? this.model.findById(this.id)
      : this.model.findOne(this.queryFilter);

    if (this.selectFields) {
      query.select(this.selectFields);
    }

    if (this.sortOptions) {
      query.sort(this.sortOptions as any);
    }

    for (const populate of this.populateOptions) {
      query.populate(populate);
    }

    return (await query.exec()) as unknown as TResult;
  }

  async execute(): Promise<PaginatedResult<T> | T[]> {
    const query = this.model.find(this.queryFilter);

    if (this.selectFields) {
      query.select(this.selectFields);
    }

    if (this.sortOptions) {
      query.sort(this.sortOptions as any);
    }

    for (const pop of this.populateOptions) {
      if (pop.select) {
        query.populate(pop.path, pop.select);
      } else {
        query.populate(pop.path);
      }
    }

    if (this.paginationParams) {
      const { page, limit } = this.paginationParams;
      const skip = (page - 1) * limit;

      const [data, total] = await Promise.all([
        query.skip(skip).limit(limit).exec(),
        this.model.countDocuments(this.queryFilter),
      ]);

      const totalPages = Math.ceil(total / limit);

      return {
        data: data as T[],
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNext: page < totalPages,
          hasPrevious: page > 1,
        },
      };
    }

    const results = await query.exec();
    return results as T[];
  }
}
