const MAX_DISTRIBUTOR_NAME_LENGTH = 38;

export function formatDistributorName(name: string) {
  return name.length > MAX_DISTRIBUTOR_NAME_LENGTH
    ? `${name.slice(0, MAX_DISTRIBUTOR_NAME_LENGTH - 3).trimEnd()}...`
    : name;
}
