/* eslint-disable @next/next/no-img-element */

import { getNextFlyer } from "@/lib/flyers";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const flyer = await getNextFlyer();

  if (!flyer) {
    return (
      <main className="flyer-page flyer-page-empty">
        <p>No upcoming party flyer found in <code>public/party-flyers</code>.</p>
      </main>
    );
  }

  return (
    <main className="flyer-page">
      <img className="flyer-image" src={flyer.src} alt="Next party flyer" />
    </main>
  );
}
