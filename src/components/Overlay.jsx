import React from "react";

export const Overlay = () => {
  return (
    <div className="h-[200vh] z-50 flex justify-around items-center">
      <div className="flex-1 mx-4 p-6 bg-white border border-gray-300 rounded-lg shadow-md text-center">
        <p className="text-lg text-gray-700">This is the first container.</p>
      </div>
      <div className="flex-1 mx-4 p-6 bg-white border border-gray-300 rounded-lg shadow-md text-center">
        <p className="text-lg text-gray-700">This is the second container.</p>
      </div>
      <div className="flex-1 mx-4 p-6 bg-white border border-gray-300 rounded-lg shadow-md text-center">
        <p className="text-lg text-gray-700">This is the third container.</p>
      </div>
    </div>
  );
};
