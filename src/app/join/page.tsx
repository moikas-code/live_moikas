"use client";

import Link from 'next/link';

export default function JoinPage() {
  return (
    <main className="container mx-auto px-2 py-8 max-w-6xl">
      <div className="flex justify-start mb-4">
        <Link
          href="/"
          className="btn btn-ghost btn-sm font-semibold"
        >
          ← Back to Main Page
        </Link>
      </div>
      <section className="bg-base-100 rounded-lg shadow-md p-4 sm:p-8 max-w-2xl mx-auto">
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-3 sm:mb-4 text-center">Join the Community & Become a Moikas Affiliate</h1>
        <p className="mb-4 sm:mb-6 text-base-content/80 text-base sm:text-lg text-center">
          Are you a passionate creator who wants to be featured on <span className="font-bold">live.moikas</span> and join our awesome community? We&apos;re always looking for new streamers and content creators to join the family!
        </p>
        <ul className="list-disc pl-5 sm:pl-6 mb-4 sm:mb-6 text-base-content/80 text-sm sm:text-base">
          <li>Get your stream featured on our platform</li>
          <li>Earn commissions as a Moikas affiliate</li>
          <li>Access exclusive promo materials and support</li>
          <li>Grow your audience with our network</li>
        </ul>
        <p className="mb-6 sm:mb-8 text-base-content/80 text-sm sm:text-base text-center">
          To be added to the stream list, you&apos;ll need to apply and become a Moikas affiliate. Tap the button below to learn more and start your application!
        </p>
        <div className="flex justify-center">
          <a
            href="https://moikas.com/pages/creator-program"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary text-base sm:text-lg px-4 sm:px-6 py-2 sm:py-3 rounded shadow font-bold w-full sm:w-auto"
          >
            Apply to Become a Moikas Affiliate
          </a>
        </div>
      </section>
    </main>
  );
} 