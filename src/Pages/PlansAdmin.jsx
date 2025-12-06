import { useEffect, useState } from "react";

import AddPlanModal from "../Component/AddPlanModal";
import EditPlanModal from "../Component/EditPlanModal";
import DeletePlanModal from "../Component/DeletePlanModal";
import { usePlanStore } from "../Store/PlanStore";

export default function PlansAdmin() {
  const { plans, fetchPlans, loading } = usePlanStore();

  const [showAdd, setShowAdd] = useState(false);
  const [editPlan, setEditPlan] = useState(null);
  const [deletePlan, setDeletePlan] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  return (
    <div className="container mt-5">

      <div className="d-flex justify-content-between mb-4">
        <h3>Manage Plans</h3>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          + Add Plan
        </button>
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="table table-striped table-bordered">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Billing Cycle</th>
                  <th>Recommended</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {plans.map((p) => (
                  <tr key={p._id}>
                    <td>{p.name}</td>
                    <td>{p.price} {p.currency}</td>
                    <td>{p.billing_cycle}</td>
                    <td>
                      {p.recommended ? (
                        <span className="badge bg-success">Yes</span>
                      ) : (
                        <span className="badge bg-secondary">No</span>
                      )}
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => setEditPlan(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => setDeletePlan(p)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* ADD MODAL */}
      <AddPlanModal show={showAdd} onClose={() => setShowAdd(false)} />

      {/* EDIT MODAL */}
      {editPlan && (
        <EditPlanModal
          show={!!editPlan}
          plan={editPlan}
          onClose={() => setEditPlan(null)}
        />
      )}

      {/* DELETE MODAL */}
      {deletePlan && (
        <DeletePlanModal
          show={!!deletePlan}
          plan={deletePlan}
          onClose={() => setDeletePlan(null)}
        />
      )}
    </div>
  );
}
