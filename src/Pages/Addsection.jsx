import React from "react";
import AddSectionForm from "../Component/AddSectionForm";
import { useParams } from "react-router-dom";

function AddSection() {
    const { id } = useParams();
  const courseId = id; // replace with actual id from DB

  return (
    <div className="py-5" style={{  minHeight: "100vh" }}>
      
        <AddSectionForm courseId={courseId} />
      
    </div>
  );
}

export default AddSection;
