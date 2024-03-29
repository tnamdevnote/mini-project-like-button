import useSWR from "swr";

async function getLikes() {
  const res = await fetch("api/likes/");
  if (!res.ok) {
    throw new Error("Failed to fetch likes");
  }
  return res.json();
}

async function incrementLikes() {
  const res = await fetch("api/likes/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error("Failed to post likes");
  }

  return res.json();
}

async function decrementLikes() {
  const res = await fetch("api/likes/", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    throw new Error("Failed to post likes");
  }

  return res.json();
}

/**
 * A hook to fetch and update like counts.
 * @remark Optimistically update like counts using SWR mutate
 */
export function useLikes() {
  const { data, error, isLoading, mutate } = useSWR("likes", getLikes, {
    refreshInterval: 120000,
  });

  const increment = () => {
    if (data.likes >= 10) return;
    // Optimistic UI Pattern. Increment cached data while sending POST request to DB
    incrementLikes();
    mutate(
      {
        total: data.total + 1,
        likes: data.likes + 1,
      },
      {
        populateCache: true,
        revalidate: false,
        rollbackOnError: true,
      },
    );
  };

  const decrement = () => {
    if (data.likes <= 0) return;
    // Optimistic UI Pattern. Decrement cached data while sending PUT request to DB
    decrementLikes();
    mutate(
      {
        total: data.total - 1,
        likes: data.likes - 1,
      },
      {
        populateCache: true,
        revalidate: false,
        rollbackOnError: true,
      },
    );
  };

  return {
    totalLikes: data?.total,
    currentLikes: data?.likes,
    error,
    isLoading,
    increment,
    decrement,
  };
}
