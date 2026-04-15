"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, Camera, Package, ShoppingCart, Settings, Key, LogOut, ChevronRight } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { userApi } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, refetch } = authClient.useSession();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Sync name state when session loads
  useEffect(() => {
    if (session?.user?.name) setName(session.user.name);
  }, [session]);

  if (!session?.user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
        <div className="p-4 bg-rose-50 rounded-full">
          <User size={40} className="text-rose-500 animate-pulse" />
        </div>
        <p className="text-gray-500 font-medium text-lg">Please login to view profile</p>
        <Link href="/auth/login" className="px-8 py-3 bg-rose-600 text-white rounded-full hover:bg-rose-700 transition-all shadow-lg hover:shadow-rose-200">
          Login Account
        </Link>
      </div>
    );
  }

  const user = session.user;

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      const form = new FormData();
      if (name !== user.name) form.append("name", name);
      await userApi.updateProfile(form);
      toast.success("Profile updated successfully!");
      refetch();
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
    toast.success("Logged out successfully");
    router.push("/");
    router.refresh();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto py-12 px-4 sm:px-6 relative overflow-hidden"
    >
      {/* Floating Background Shapes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        className="absolute top-0 left-1/4 w-64 h-64 bg-rose-300 rounded-full filter blur-3xl animate-blob"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        className="absolute bottom-0 right-1/3 w-96 h-96 bg-blue-400 rounded-full filter blur-3xl animate-blob animation-delay-2000"
      />

      <header className="mb-10 relative z-10">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Settings</h1>
        <p className="text-gray-500 mt-1">Manage your profile information and account security.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Left Column: Sidebar Profile */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white/70 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col items-center text-center"
          >
            <motion.div 
              whileHover={{ rotateY: 15 }} 
              className="relative group cursor-pointer"
            >
              <div className="w-28 h-28 rounded-full bg-gradient-to-tr from-rose-500 to-orange-400 p-1">
                <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-rose-600 text-4xl font-bold border-4 border-white overflow-hidden">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-lg border border-gray-100 group-hover:scale-110 transition-transform">
                <Camera size={16} className="text-gray-600" />
              </div>
            </motion.div>

            <h2 className="mt-4 text-xl font-bold text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 mb-4">{user.email}</p>
            
            <motion.div 
              animate={{ scale: [1, 1.05, 1], rotate: [0, 5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                user.role === "ADMIN" ? "bg-rose-100 text-rose-700" : "bg-blue-100 text-blue-700"
              }`}
            >
              {user.role === "ADMIN" ? "👑 Administrator" : "👤 Member"}
            </motion.div>
          </motion.div>

          <div className="bg-white rounded-3xl p-4 shadow-md border border-gray-100 space-y-1">
             <ProfileNavLink href="/orders" icon={<Package size={18}/>} label="My Orders" />
             <ProfileNavLink href="/cart" icon={<ShoppingCart size={18}/>} label="Shopping Cart" />
             {user.role === "ADMIN" && (
               <ProfileNavLink href="/admin" icon={<Settings size={18}/>} label="Admin Dashboard" highlight />
             )}
             <ProfileNavLink href="/auth/forgot-password" icon={<Key size={18}/>} label="Security" />
          </div>

          <motion.button 
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-4 px-4 text-red-600 font-semibold bg-red-50 hover:bg-red-100 rounded-2xl transition-all border border-red-100 shadow-neumorphic"
          >
            <LogOut size={18} /> Logout
          </motion.button>
        </div>

        {/* Right Column: Forms */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
          >
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-rose-50 rounded-lg">
                <User size={20} className="text-rose-600" />
              </div>
              <h3 className="text-lg font-bold text-gray-800">Personal Information</h3>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Full Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10 transition-all outline-none"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      value={user.email} 
                      disabled 
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 ml-1 italic">Contact support to change your email address.</p>
                </div>
              </div>

              <motion.button 
                whileTap={{ scale: 0.98 }}
                type="submit" 
                disabled={loading || name === user.name} 
                className="w-full sm:w-auto px-8 py-3.5 bg-gray-900 text-white font-semibold rounded-xl hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-neumorphic"
              >
                {loading ? "Updating..." : "Save Changes"}
              </motion.button>
            </form>
          </motion.div>

          {/* Account Health/Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl text-white">
              <Shield className="text-rose-400 mb-4" size={24} />
              <p className="text-slate-400 text-sm">Account Security</p>
              <h4 className="text-xl font-bold">Two-Factor Auth</h4>
              <button className="mt-4 text-xs font-bold uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors">Enable Now →</button>
            </div>
            <div className="p-6 bg-rose-600 rounded-3xl text-white">
              <Package className="text-rose-200 mb-4" size={24} />
              <p className="text-rose-200 text-sm">Active Orders</p>
              <h4 className="text-xl font-bold">03 Pending Items</h4>
              <Link href="/orders" className="mt-4 inline-block text-xs font-bold uppercase tracking-widest text-white/80 hover:text-white transition-colors">View Details →</Link>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Helper Component for Navigation Links
function ProfileNavLink({ href, icon, label, highlight = false }: { href: string, icon: React.ReactNode, label: string, highlight?: boolean }) {
  return (
    <Link href={href}>
      <motion.div 
        whileHover={{ x: 5 }}
        className={`flex items-center justify-between p-3.5 rounded-xl transition-all group ${
          highlight ? "bg-rose-50 text-rose-700" : "hover:bg-gray-50 text-gray-600 hover:text-gray-900"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className={highlight ? "text-rose-600" : "text-gray-400 group-hover:text-rose-500 transition-colors"}>
            {icon}
          </span>
          <span className="text-sm font-semibold">{label}</span>
        </div>
        <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-all text-gray-400" />
      </motion.div>
    </Link>
  );
}