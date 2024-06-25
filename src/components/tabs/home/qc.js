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

// Utils
import { getTimeframeDates } from "@/utils";

// Constants
import { TIMEFRAMES } from "@/constants";

const schema = z.object({
  timeframe: z.string().nonempty("Timeframe is required"),
});

const defaultValues = {
  timeframe: "today",
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
  const timeframeReference = useRef(defaultValues.timeframe);

  const refetch = async () => {
    await fetchQCs();
  };

  const fetchQCs = async () => {
    try {
      setIsLoading(true);

      const { timeframe } = getValues();

      const { startDate, endDate } = getTimeframeDates(timeframe);

      const reference = collection(db, "qc_requests");

      let q = reference;

      if (startDate && endDate) {
        q = query(
          reference,
          where("createdAt", ">=", startDate),
          where("createdAt", "<=", endDate)
        );
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

      fetchQCs(getValues().timeframe);
    }
  }, []);

  const timeframe = watch("timeframe");

  useEffect(() => {
    if (!loadReference.current && timeframeReference.current !== timeframe) {
      timeframeReference.current = timeframe;

      fetchQCs(timeframe);
    }
  }, [timeframe]);

  return (
    <Box
      display="flex"
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
    >
      {/* Timeframe */}
      <Controller
        name="timeframe"
        control={control}
        render={({ field }) => (
          <SelectInput
            {...field}
            fullWidth
            label="Timeframe*"
            variant="outlined"
            error={!!errors.timeframe}
            message={errors.timeframe?.message}
          >
            {TIMEFRAMES.map((s) => (
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
