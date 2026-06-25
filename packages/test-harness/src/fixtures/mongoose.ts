export function mockObjectId(value = '64f000000000000000000001') {
  return {
    toString() {
      return value;
    },
  };
}
