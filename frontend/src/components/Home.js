import React from "react";
import Notes from "./Notes";

const Home = (props) => {
  return (
    <>
      <div className="mx-auto py-4 sm:px-2 lg:px-4">

      <Notes showAlert={props.showAlert}/>
      </div>
    </>
  );
};

export default Home;
