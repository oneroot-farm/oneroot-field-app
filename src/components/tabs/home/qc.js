"use client";

import { useRef, useState, useEffect } from "react";

import { z } from "zod";
import { toast } from "react-toastify";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Box, MenuItem } from "@mui/material";

// Firebase
import { db } from "@/firebase";
import {
  doc,
  query,
  where,
  getDoc,
  getDocs,
  collection,
} from "firebase/firestore";

// Components
import Loader from "@/components/loader";
import SelectInput from "@/components/inputs/selectInput";
import QCGrid from "@/components/grids/qc";

// Constants
import { QC_STATUSES } from "@/constants";

const schema = z.object({
  status: z.string().nonempty("Status is required"),
});

const defaultValues = {
  status: "pending",
};

const QC = () => {
  const {
    watch,
    control,
    getValues,
    formState: { errors },
  } = useForm({
    defaultValues,
    resolver: zodResolver(schema),
  });

  const [qcs, setQCs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadReference = useRef(true);
  const statusReference = useRef(defaultValues.status);

  const refetch = async () => {
    await fetchQCs();
  };

  const fetchQCs = async () => {
    try {
      setIsLoading(true);

      const { status } = getValues();

      const reference = collection(db, "qc_requests");

      let q = reference;

      if (status) {
        q = query(reference, where("status", "==", status));
      }

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Found 0 qc request records.");

        setQCs([]);
      } else {
        const results = [];

        for (const qcRequestDoc of querySnapshot.docs) {
          const qcRequest = { ...qcRequestDoc.data() };

          // fetch crop data
          if (qcRequest.cropId) {
            const cropDocument = await getDoc(
              doc(db, "crops", qcRequest.cropId)
            );

            if (cropDocument.exists()) {
              qcRequest.crop = { ...cropDocument.data() };
            } else {
              qcRequest.crop = null;
            }
          }

          // fetch user data
          if (qcRequest.userId) {
            const userDocument = await getDoc(
              doc(db, "users", qcRequest.userId)
            );

            if (userDocument.exists()) {
              qcRequest.user = { ...userDocument.data() };
            } else {
              qcRequest.user = null;
            }
          }

          results.push(qcRequest);
        }

        toast.success(`Found ${results.length} qc request records.`);

        setQCs(results);
      }
    } catch (error) {
      toast.error("Failed to fetch qc request data.");

      console.error("Error fetching qc request data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loadReference.current) {
      loadReference.current = false;

      fetchQCs(getValues().status);
    }
  }, []);

  const status = watch("status");

  useEffect(() => {
    if (!loadReference.current && statusReference.current !== status) {
      statusReference.current = status;

      fetchQCs(status);
    }
  }, [status]);

  return (
    <Box
      display="flex"
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
    >
      {/* Status */}
      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <SelectInput
            {...field}
            fullWidth
            label="Status*"
            variant="outlined"
            error={!!errors.status}
            message={errors.status?.message}
          >
            {QC_STATUSES.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </SelectInput>
        )}
      />

      {/* Grid */}
      <QCGrid data={qcs} refetch={refetch} />

      {/* Loader */}
      <Loader open={isLoading} />
    </Box>
  );
};

export default QC;
