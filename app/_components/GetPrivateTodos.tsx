"use client";

import { trpc } from "../_trpc/client"

export const GetPrivateTodos = () => {
  const { data, isLoading } = trpc.getSecretTodos.useQuery();
  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!data) {
    return <div>No data</div>
  }

  return (
    <ul>
      {
        data.map((todo, index) => {
          return <div key={index}>{todo}</div>
        })
      }
    </ul>
  )
}