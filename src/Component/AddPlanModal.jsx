import { useState } from "react";
import { usePlanStore } from "../Store/PlanStore";
import toast from "react-hot-toast";

export default function AddPlanModal({ show, onClose }) {
  const { createPlan, loading } = usePlanStore();

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [billing_cycle, setBillingCycle] = useState("One-time");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState([{ text: "", available: true }]);
  const [recommended, setRecommended] = useState(false);
  const [buttonText, setButtonText] = useState("Get Started");
  const [redirectLink, setRedirectLink] = useState("/home");

  if (!show) return null;

  const addFeature = () => {
    setFeatures([...features, { text: "", available: true }]);
  };

  const removeFeature = (i) => {
    const list = features.filter((_, index) => index !== i);
    setFeatures(list);
  };

  const updateFeature = (i, key, value) => {
    const list = [...features];
    list[i][key] = value;
    setFeatures(list);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      name,
      price,
      currency,
      billing_cycle,
      description,
      features,
      recommended,
      buttonText,
      redirectLink,
    };

    const res = await createPlan(data);
    if (res) {
      toast.success("Plan created!");
      onClose();
    }
  };

  return (
    <div className="modal show fade d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">Add New Plan</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              {/* Name */}
              <div className="mb-3">
                <label className="form-label">Plan Name</label>
                <input
                  className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              {/* Price */}
              <div className="mb-3">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                />
              </div>

              {/* Features */}
              <label className="fw-bold">Features</label>

              {features.map((f, i) => (
                <div key={i} className="row mb-2">
                  <div className="col-8">
                    <input
                      className="form-control"
                      value={f.text}
                      onChange={(e) =>
                        updateFeature(i, "text", e.target.value)
                      }
                    />
                  </div>
                  <div className="col-2">
                    <select
                      className="form-select"
                      value={f.available}
                      onChange={(e) =>
                        updateFeature(i, "available", e.target.value === "true")
                      }
                    >
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </select>
                  </div>
                  <div className="col-2">
                    <button
                      type="button"
                      className="btn btn-danger w-100"
                      onClick={() => removeFeature(i)}
                    >
                      X
                    </button>
                  </div>
                </div>
              ))}

              <button
                className="btn btn-outline-primary"
                type="button"
                onClick={addFeature}
              >
                + Add Feature
              </button>

              <hr />

              <button className="btn btn-success w-100" disabled={loading}>
                {loading ? "Saving..." : "Create Plan"}
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
