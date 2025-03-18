import React, { useEffect } from "react";
import Notes from "./Notes";

const Home = (props) => {

  useEffect(() => {
    document.title = 'iNotebook - Your notes secured in the cloud';
  }, []);

  return (
    <>
      <div className="mx-auto py-4 sm:px-2 lg:px-4">
        <Notes showAlert={props.showAlert} />
      </div>
    </>
  );
};

export default Home;