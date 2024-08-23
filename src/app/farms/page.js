"use client";

import { useRef, useState, useEffect } from "react";

import { toast } from "react-toastify";

import { Box } from "@mui/material";

// Firebase
import { db } from "@/firebase";
import { query, where, getDocs, collection } from "firebase/firestore";

// Components
import Loader from "@/components/loader";
import CropGrid from "@/components/grids/crop";

// Utils
import { getTimeframeDates } from "@/utils";

const Farms = () => {
  const [farms, setFarms] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadReference = useRef(true);

  const refetch = async () => {
    await fetchFarms();
  };

  const fetchFarms = async () => {
    try {
      setIsLoading(true);

      const reference = collection(db, "crops");

      let q = reference;

      q = query(reference, where("tags", "array-contains", "markhet-app"));

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast.error("Found 0 farm records.");

        setFarms([]);
      } else {
        const results = [];

        querySnapshot.forEach((doc) => {
          results.push({ id: doc.id, ...doc.data() });
        });

        toast.success(`Found ${results.length} farm records.`);

        setFarms(results);
      }
    } catch (error) {
      toast.error("Failed to fetch farm data.");

      console.error("Error fetching farm data: ", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (loadReference.current) {
      loadReference.current = false;

      fetchFarms();
    }
  }, []);

  return (
    <Box
      display="flex"
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
    >
      {/* Grid */}
      <CropGrid data={farms} refetch={refetch} />

      {/* Loader */}
      <Loader open={isLoading} />
    </Box>
  );
};

export default Farms;
