import { useEffect } from "react";
import Link from "next/link";

export default function FirstPost() {
  useEffect(() => {
    console.log("yo");
  }, []);

  return (
    <>
      <h1>First Post</h1>
      <h2>
        <Link href="/">Back to home</Link>
      </h2>
    </>
  );
}
