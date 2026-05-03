router.post('/register', register);

router.post('/verify-otp', verifyOtpLimiter, verifyOTP);
router.post('/resend-otp', resendOTP);
router.post('/login', loginLimiter, login);
router.post("/verify-user", verifyToken, uploadMiddleware, verifyUser);
router.get('/get-current-user', verifyToken, getCurrentUser);
router.post('/forgot-password', generatePasswordResetToken);
router.post('/reset-password', resetPasswordWithToken);
const isValidRuetEmail = (email) => {
const patterns = [
/^[0-9]+@student\.ruet\.ac\.bd$/i,       // RUET: 2010033@student.ruet.ac.bd
      /^s[0-9]+@ru\.ac\.bd$/i, // RU: s2310876102@ru.ac.bd
/^[0-9]{7}@[a-z]+\.buet\.ac\.bd$/i,      // BUET: 2212011@cse.buet.ac.bd
      /^[0-9]{10}@student\.sust\.edu$/i, // SUST: 2024134111@student.sust.edu
/^[a-z0-9._]+@iut-dhaka\.edu$/i, // IUT: rafsanasif@iut-dhaka.edu
];
return patterns.some((regex) => regex.test(email));
};

//const { getGeoLocation } = useGeoLocation();
const [formData, setFormData] = useState({
name: "",
email: "",
password: "",
repassword: "",
});

const handleChange = (e) => {
setFormData((prevData) => ({
...prevData,
[e.target.name]: e.target.value,
}));
};

const handleRegister = async (e) => {
e.preventDefault();

    if (formData.password !== formData.repassword) {
      Swal.fire({
        icon: "warning",
        title: "Password Mismatch",
        text: "Passwords do not match. Please re-enter them.",
      });
      return;
    }

    try {
      setLoading(true);
      const coords = {};
      coords.latitude = 33.33;
      coords.longitude = 33.33;

      const ipResponse = await fetch("https://api.ipify.org?format=json");
      const { ip } = await ipResponse.json();

      const res = await api.post("/api/v1/auth/register", {
        ...formData,
        latitude: coords.latitude,
        longitude: coords.longitude,
        ipAddress: ip || "xxx.xxx.xxx.xxx",
      });

      console.log(res);

      if (!res.data.success) {
        closeRegModal();
        Swal.fire({
          icon: "error",
          title: "Registration Failed",
          text: res.message || "An error occurred while registering.",
        });
        return;
      }
      closeRegModal();
      await setTempUser(res.data.user);
      navigate("/verify-otp");
    } catch (error) {
      console.error("Registration Error:", error);
      Swal.fire({
        icon: "error",
        title: "Something went wrong",
        text: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }

};

if (!isRegModalOpen) return null;

if (loading) {
return <Loader />;
}
