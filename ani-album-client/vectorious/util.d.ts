import { DType, TypedArray, TypedArrayConstructor } from './types';
export declare const flatten: (input: any[]) => number[];
export declare const get_shape: (input: any) => number[];
export declare const get_dtype: (input: TypedArray) => DType;
export declare const get_type: (input: DType) => TypedArrayConstructor;
export declare const is_typed_array: (input: any) => boolean;
