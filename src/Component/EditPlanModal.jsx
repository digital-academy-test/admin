import { useState, useEffect } from "react";
import { usePlanStore } from "../Store/PlanStore";
import toast from "react-hot-toast";

export default function EditPlanModal({ show, onClose, plan }) {
  const { updatePlan, loading } = usePlanStore();

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [currency, setCurrency] = useState("USD");
  const [billing_cycle, setBillingCycle] = useState("One-time");
  const [description, setDescription] = useState("");
  const [features, setFeatures] = useState([]);
  const [recommended, setRecommended] = useState(false);
  const [buttonText, setButtonText] = useState("Get Started");
  const [redirectLink, setRedirectLink] = useState("/home");

  useEffect(() => {
    if (plan) {
      setName(plan.name);
      setPrice(plan.price);
      setCurrency(plan.currency);
      setBillingCycle(plan.billing_cycle);
      setDescription(plan.description);
      setFeatures(plan.features || []);
      setRecommended(plan.recommended);
      setButtonText(plan.buttonText);
      setRedirectLink(plan.redirectLink);
    }
  }, [plan]);

  if (!show) return null;

  const addFeature = () => {
    setFeatures([...features, { text: "", available: true }]);
  };

  const removeFeature = (i) => {
    setFeatures(features.filter((_, idx) => idx !== i));
  };

  const updateFeature = (index, key, value) => {
    const updated = [...features];
    updated[index][key] = value;
    setFeatures(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updatedData = {
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

    const res = await updatePlan(plan._id, updatedData);

    if (res) {
      //toast.success("Plan updated!");
      onClose();
    }
  };

  return (
    <div className="modal show fade d-block" tabIndex="-1">
      <div className="modal-dialog modal-lg">
        <div className="modal-content">

          <div className="modal-header">
            <h5 className="modal-title">Edit Plan</h5>
            <button className="btn-close" onClick={onClose}></button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="modal-body">

              <div className="mb-3">
                <label className="form-label">Plan Name</label>
                <input className="form-control"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="row">
                <div className="col-4 mb-3">
                  <label className="form-label">Price</label>
                  <input
                    type="number"
                    className="form-control"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                </div>

                <div className="col-4 mb-3">
                  <label className="form-label">Currency</label>
                  <select
                    className="form-select"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                  >
                    <option>USD</option>
                    <option>NGN</option>
                    <option>EUR</option>
                  </select>
                </div>

                <div className="col-4 mb-3">
                  <label className="form-label">Billing Cycle</label>
                  <select
                    className="form-select"
                    value={billing_cycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                  >
                    <option>One-time</option>
                    <option>Monthly</option>
                    <option>Yearly</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="mb-3">
                <label className="form-label">Description</label>
                <textarea
                  className="form-control"
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                ></textarea>
              </div>

              {/* Features */}
              <label className="fw-bold">Features</label>

              {features.map((f, i) => (
                <div className="row mb-2" key={i}>
                  <div className="col-8">
                    <input
                      className="form-control"
                      value={f.text}
                      onChange={(e) => updateFeature(i, "text", e.target.value)}
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
                type="button"
                className="btn btn-outline-primary mb-3"
                onClick={addFeature}
              >
                + Add Feature
              </button>

              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={recommended}
                  onChange={(e) => setRecommended(e.target.checked)}
                />
                <label className="form-check-label">Recommended</label>
              </div>

              <div className="mb-3">
                <label className="form-label">Button Text</label>
                <input
                  className="form-control"
                  value={buttonText}
                  onChange={(e) => setButtonText(e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Redirect Link</label>
                <input
                  className="form-control"
                  value={redirectLink}
                  onChange={(e) => setRedirectLink(e.target.value)}
                />
              </div>

            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Cancel
              </button>

              <button className="btn btn-success" disabled={loading}>
                {loading ? "Updating..." : "Save Changes"}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
