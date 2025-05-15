
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const Dashboard = () => {
  // Mock data for the dashboard
  const mockUserData = {
    name: "John Doe",
    email: "john.doe@university.edu",
    credits: 350,
    trustLevel: "Silver",
    currentRentals: [
      {
        id: 1,
        title: "Portable Projector",
        dueDate: "2025-05-15",
        owner: "Jane Smith",
        status: "Active",
      },
      {
        id: 2,
        title: "Camping Tent (4-person)",
        dueDate: "2025-05-20",
        owner: "Mike Johnson",
        status: "Active",
      },
    ],
    myItems: [
      {
        id: 101,
        title: "Mountain Bike",
        status: "Available",
        rentalCount: 8,
        earnings: "$120 / 140 credits",
      },
      {
        id: 102,
        title: "DSLR Camera Kit",
        status: "Rented",
        rentalCount: 12,
        earnings: "$300 / 240 credits",
      },
      {
        id: 103,
        title: "Wireless Speaker System",
        status: "Available",
        rentalCount: 5,
        earnings: "$75 / 60 credits",
      },
    ],
    rentalHistory: [
      {
        id: 201,
        title: "Lawn Mower",
        date: "2025-04-10",
        owner: "Alice Brown",
        status: "Completed",
      },
      {
        id: 202,
        title: "Power Drill",
        date: "2025-04-01",
        owner: "Bob Wilson",
        status: "Completed",
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow bg-gray-50">
        <div className="brittoo-container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
              <p className="text-gray-600">Welcome back, {mockUserData.name}</p>
            </div>
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-3">
              <Button asChild className="bg-brittoo-green hover:bg-brittoo-green-dark text-white">
                <Link to="/listings/create">Add New Listing</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Available Credits
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-brittoo-green">
                  {mockUserData.credits}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Credits can be used to rent items without cash deposit
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Trust Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="trust-badge trust-badge-silver px-2 py-1 mr-2">
                    {mockUserData.trustLevel}
                  </div>
                  <div className="text-2xl font-bold">65%</div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-brittoo-green h-2.5 rounded-full" style={{ width: '65%' }}></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  35 more points until Gold level
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Account Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  <span className="font-semibold">Verified</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Email & ID verified · Profile 100% complete
                </p>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="current-rentals" className="w-full">
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="current-rentals">Current Rentals</TabsTrigger>
              <TabsTrigger value="my-items">My Items</TabsTrigger>
              <TabsTrigger value="history">Rental History</TabsTrigger>
            </TabsList>

            <TabsContent value="current-rentals" className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Items You're Currently Renting</h2>
              {mockUserData.currentRentals.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-500">You're not renting any items right now.</p>
                    <Button asChild className="mt-4">
                      <Link to="/listings">Browse Items</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                mockUserData.currentRentals.map((rental) => (
                  <Card key={rental.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{rental.title}</CardTitle>
                      <CardDescription>
                        From {rental.owner} · Due {rental.dueDate}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2 flex justify-between">
                      <div className="flex items-center">
                        <div className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-sm">
                          {rental.status}
                        </div>
                      </div>
                      <Button asChild size="sm">
                        <Link to={`/rentals/${rental.id}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="my-items" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Items You're Offering</h2>
                <Button asChild size="sm" className="bg-brittoo-green hover:bg-brittoo-green-dark text-white">
                  <Link to="/listings/create">Add New Item</Link>
                </Button>
              </div>
              
              {mockUserData.myItems.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-500">You haven't listed any items yet.</p>
                    <Button asChild className="mt-4">
                      <Link to="/listings/create">Add Your First Item</Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                mockUserData.myItems.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>
                        {item.rentalCount} rentals · Earned: {item.earnings}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2 flex justify-between">
                      <div className="flex items-center">
                        <div className={`px-2 py-0.5 rounded text-sm ${
                          item.status === "Available" 
                          ? "bg-green-100 text-green-800" 
                          : "bg-amber-100 text-amber-800"
                        }`}>
                          {item.status}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/listings/${item.id}/edit`}>Edit</Link>
                        </Button>
                        <Button asChild size="sm">
                          <Link to={`/listings/${item.id}`}>View</Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Past Rentals</h2>
              {mockUserData.rentalHistory.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-500">No rental history yet.</p>
                  </CardContent>
                </Card>
              ) : (
                mockUserData.rentalHistory.map((rental) => (
                  <Card key={rental.id}>
                    <CardHeader className="pb-2">
                      <CardTitle>{rental.title}</CardTitle>
                      <CardDescription>
                        From {rental.owner} · {rental.date}
                      </CardDescription>
                    </CardHeader>
                    <CardFooter className="pt-2 flex justify-between">
                      <div className="flex items-center">
                        <div className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded text-sm">
                          {rental.status}
                        </div>
                      </div>
                      <Button asChild size="sm" variant="outline">
                        <Link to={`/rentals/${rental.id}`}>View Details</Link>
                      </Button>
                    </CardFooter>
                  </Card>
                ))
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
