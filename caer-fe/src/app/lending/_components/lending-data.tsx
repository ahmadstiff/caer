import React from "react";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
} from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

const LendingData = () => {
  return (
    <div>
      <Button>Available Pools</Button>
      <Button>My Pools</Button>
    </div>
  );
};

export default LendingData;
