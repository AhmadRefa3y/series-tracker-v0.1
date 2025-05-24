"use client";
import React from "react";
import { test } from "../../app2/actions";

const ClientBtn = () => {
  return (
    <button
      onClick={async () => {
        await test();
      }}
    >
      test
    </button>
  );
};

export default ClientBtn;
