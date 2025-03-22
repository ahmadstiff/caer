import PositionHeader  from "@/components/card/borrow/position-header";
import PositionTable from "@/components/card/borrow/position-table";
import React from "react";

const page = () => {
  return (
    <div>
      <PositionHeader />
      <PositionTable />
    </div>
  );
};

export default page;
