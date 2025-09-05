import React, { useEffect } from "react";
import { Check, X, Eye, Download } from "lucide-react";
import { useVendors } from "../../context/VendorContext";

const VendorApplications = () => {
  const {
    vendorApplications,
    approveApplication,
    rejectApplication,
    getVendorApplications,
  } = useVendors();

  console.log(vendorApplications);

  useEffect(() => {
    getVendorApplications();
  }, []);

  const handleApprove = (applicationId) => {
    approveApplication(applicationId);
  };

  const handleReject = (applicationId) => {
    rejectApplication(applicationId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Vendor Applications
          </h1>
          <p className="text-gray-600 mt-2">
            Review and manage vendor applications
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Pending Applications ({vendorApplications.length})
            </h3>
          </div>

          {vendorApplications.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500">No pending applications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {vendorApplications.map((application) => (
                <div key={application.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-900">
                          {application?.vendorInfo.shopName}
                        </h4>
                        <span className="ml-2 px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          Pending
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Owner:</span>{" "}
                            {application.name}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Email:</span>{" "}
                            {application.email}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Business Type:</span>{" "}
                            {application.vendorInfo.businessType}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Applied:</span>{" "}
                            {application.vendorInfo.applicationDate}
                          </p>
                        </div>
                      </div>

                      {application.documents &&
                        application.documents.length > 0 && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-gray-900 mb-2">
                              Documents:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {application.documents.map((doc, index) => (
                                <button
                                  key={index}
                                  className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  {doc}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                    </div>

                    <div className="ml-6 flex flex-col space-y-2">
                      <button
                        onClick={() => handleApprove(application._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleReject(application._id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </button>
                      <button className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                        <Eye className="h-4 w-4 mr-1" />
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorApplications;
