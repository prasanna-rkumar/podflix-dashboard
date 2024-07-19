import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

export default async function DashboardLayput({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession();
  if (!session || !session.user) {
    redirect("/");
  }
  return (
    <div>{children}</div>
  );
}
