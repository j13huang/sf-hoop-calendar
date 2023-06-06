import useSWRImmutable from "swr";

const fetcher = (input: RequestInfo | URL, init?: RequestInit) =>
  fetch(input, init).then((res) => res.json());

export default function useSchedule(location, enabled) {
  const { data, error, isLoading } = useSWRImmutable(
    enabled ? `/api/schedule?location=${location}` : null,
    fetcher
  );

  return {
    timeIntervals: data,
    isLoading,
    isError: error,
  };
}
