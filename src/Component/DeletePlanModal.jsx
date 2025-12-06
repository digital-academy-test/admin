import { usePlanStore } from "../Store/PlanStore";
import toast from "react-hot-toast";

export default function DeletePlanModal({ show, onClose, plan }) {
  const { deletePlan, loading } = usePlanStore();

  if (!show) return null;

  const handleDelete = async () => {
    const ok = await deletePlan(plan._id);
    if (ok) {
      toast.success("Plan deleted!");
      onClose();
    }
  };

  return (
    <div className="modal show fade d-block" tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content">

          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">Delete Plan</h5>
            <button className="btn-close btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            <p>
              Are you sure you want to delete: <strong>{plan.name}</strong>?
            </p>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-danger" onClick={handleDelete} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
