/** True when value is a 24-char hex MongoDB ObjectId string */
export function isMongoObjectId(value: string | null | undefined): value is string {
  return typeof value === 'string' && /^[a-f\d]{24}$/i.test(value);
}
