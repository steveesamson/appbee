import type {
    BaseIssue,
    BaseSchema,
    ErrorMessage,
    OutputDataset,
} from 'valibot';
import { _addIssue, _getStandardProps } from 'valibot';
import { importSync } from '../import-sync.js';

let _ObjectId: import('mongodb').ObjectId | undefined = undefined;
const isObjectId = function () {
    if (!_ObjectId) {
        const { ObjectId } = importSync('mongodb')
        _ObjectId = ObjectId;
    }
    return function (input: unknown) {
        const res = { isOk: false, value: undefined };
        if (typeof input !== "string") {
            return res;
        }

        if (!/^[0-9a-fA-F]{24}$/.test(input)) {
            return res;
        }

        const isOk = _ObjectId.isValid(input);
        res.isOk = isOk;
        if (isOk) {
            res.value = new _ObjectId(input);
        }
        return res;
    }

}



/**
 * ObjectId issue interface.
 */
export interface ObjectIdIssue extends BaseIssue<unknown> {
    /**
     * The issue kind.
     */
    readonly kind: 'schema';
    /**
     * The issue type.
     */
    readonly type: 'objectId';
    /**
     * The expected property.
     */
    readonly expected: 'unknown';
}

/**
 * ObjectId schema interface.
 */
export interface ObjectIdSchema<
    TMessage extends ErrorMessage<ObjectIdIssue> | undefined,
> extends BaseSchema<string, string, ObjectIdIssue> {
    /**
     * The schema type.
     */
    readonly type: 'objectId';
    /**
     * The schema reference.
     */
    readonly reference: typeof objectId;
    /**
     * The expected property.
     */
    readonly expects: 'unknown';
    /**
     * The error message.
     */
    readonly message: TMessage;
}

/**
 * Creates a MongoDB ObjectId schema.
 *
 * @returns An objectId schema.
 */
export function objectId(): ObjectIdSchema<undefined>;

/**
 * Creates an objectId schema.
 *
 * @param message The error message.
 *
 * @returns An objectId schema.
 */
export function objectId<
    const TMessage extends ErrorMessage<ObjectIdIssue> | undefined,
>(message: TMessage): ObjectIdSchema<TMessage>;

// @__NO_SIDE_EFFECTS__
export function objectId(
    message?: ErrorMessage<ObjectIdIssue>
): ObjectIdSchema<ErrorMessage<ObjectIdIssue> | undefined> {
    return {
        kind: 'schema',
        type: 'objectId',
        reference: objectId,
        expects: 'unknown',
        async: false,
        message,
        // get '~standard'() {
        //     return _getStandardProps(this);
        // },
        '~run'(dataset, config) {
            const isValid = isObjectId();
            if (dataset.value) {
                const { isOk, value } = isValid(dataset.value)
                if (isOk) {
                    dataset.value = value
                    // @ts-expect-error
                    dataset.typed = true;
                } else {
                    _addIssue(this, 'objectId', dataset, config);
                }

            } else {
                _addIssue(this, 'objectId', dataset, config);
            }
            // @ts-expect-error
            return dataset as OutputDataset<ObjectId, ObjectIdIssue>;
        },
    };
}