"use client"; //Marks the file as a client component
import React from "react";
import Image from "next/image";
import { SignIn } from "@clerk/nextjs";
import { neobrutalism } from "@clerk/themes";

//test pentru git workflow

export default function LandingPage() {
  return (
    <main className="flex items-center p-10 gap-24 animate-fade-in max-md:flex-col">
      <section className="flex flex-col items-center ">
        <Image src="/assets/logo.svg" alt="logo" width={300} height={300} />
        <h1 className="text-2xl font-black lg:text-3xl">
          Your time, perfectly planned
        </h1>
        <p className="font-extralight text-center">
          Join millions of professionals who easily book meetings with the #1
          scheduling tool.
        </p>
        <Image src="/assets/planning.svg" alt="logo" width={500} height={500} />
      </section>
      <div className="mt-3">
        <SignIn
          routing="hash"
          appearance={{
            baseTheme: neobrutalism,
          }}
        />
      </div>
    </main>
  );
}
