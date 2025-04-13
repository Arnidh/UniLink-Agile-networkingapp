
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Search, PlusCircle, MapPin, Clock, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { SelectTrigger, SelectValue, SelectContent, SelectGroup, SelectItem, Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Event {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string | null;
  category: string;
  organizer_id: string;
  image_url?: string | null;
  created_at: string;
  updated_at: string;
  organizer?: string;
  saved?: boolean;
}

const Events = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [savedEvents, setSavedEvents] = useState<string[]>([]);
  const [pastEvents, setPastEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  
  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    category: 'academic'
  });

  // Load events from Supabase
  useEffect(() => {
    const loadEvents = async () => {
      if (!currentUser) return;
      
      setIsLoading(true);
      
      try {
        // Fetch all events
        const { data: eventsData, error: eventsError } = await supabase
          .from('events')
          .select(`
            *,
            profiles:organizer_id(name)
          `);
          
        if (eventsError) throw eventsError;
        
        // Fetch user's saved events
        const { data: savedData, error: savedError } = await supabase
          .from('saved_events')
          .select('event_id')
          .eq('user_id', currentUser.id);
          
        if (savedError) throw savedError;
        
        // Transform data
        const now = new Date();
        const upcoming: Event[] = [];
        const past: Event[] = [];
        
        const savedEventIds = savedData?.map(item => item.event_id) || [];
        
        eventsData?.forEach(event => {
          const eventDate = new Date(event.date);
          const formattedEvent = {
            ...event,
            organizer: event.profiles?.name || 'Unknown',
            saved: savedEventIds.includes(event.id)
          };
          
          if (eventDate >= now) {
            upcoming.push(formattedEvent);
          } else {
            past.push(formattedEvent);
          }
        });
        
        setEvents(upcoming);
        setPastEvents(past);
        setSavedEvents(savedEventIds);
      } catch (error) {
        console.error('Error loading events:', error);
        toast.error('Failed to load events');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadEvents();
  }, [currentUser]);
  
  const handleSaveEvent = async (eventId: string, isSaved: boolean) => {
    if (!currentUser) return;
    
    try {
      if (isSaved) {
        // Remove from saved
        await supabase
          .from('saved_events')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('event_id', eventId);
          
        setSavedEvents(prev => prev.filter(id => id !== eventId));
        setEvents(prev => prev.map(event => 
          event.id === eventId ? {...event, saved: false} : event
        ));
        toast.success('Event removed from saved');
      } else {
        // Add to saved
        await supabase
          .from('saved_events')
          .insert({
            user_id: currentUser.id,
            event_id: eventId
          });
          
        setSavedEvents(prev => [...prev, eventId]);
        setEvents(prev => prev.map(event => 
          event.id === eventId ? {...event, saved: true} : event
        ));
        toast.success('Event saved');
      }
    } catch (error) {
      console.error('Error updating saved event:', error);
      toast.error('Failed to update saved events');
    }
  };

  const handleCreateEvent = async () => {
    if (!currentUser) return;
    
    try {
      // Validate required fields
      if (!newEvent.title || !newEvent.date || !newEvent.location || !newEvent.category) {
        toast.error('Please fill in all required fields');
        return;
      }
      
      // Combine date and time
      const dateTime = newEvent.time 
        ? `${newEvent.date}T${newEvent.time}`
        : `${newEvent.date}T00:00:00`;
        
      // Insert new event
      const { data, error } = await supabase
        .from('events')
        .insert({
          title: newEvent.title,
          date: dateTime,
          location: newEvent.location,
          description: newEvent.description,
          category: newEvent.category,
          organizer_id: currentUser.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Add to events list
      const newEventWithOrganizer: Event = {
        ...data,
        organizer: currentUser.user_metadata?.name || 'Me',
        saved: false
      };
      
      setEvents(prev => [newEventWithOrganizer, ...prev]);
      
      // Reset form and close dialog
      setNewEvent({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
        category: 'academic'
      });
      setOpenCreateDialog(false);
      
      toast.success('Event created successfully');
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event');
    }
  };

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'MMM d, yyyy h:mm a');
  };

  const getEventCategoryBadge = (category: string) => {
    switch(category) {
      case 'career':
        return <Badge className="bg-blue-500">Career</Badge>;
      case 'academic':
        return <Badge className="bg-green-500">Academic</Badge>;
      case 'campus':
        return <Badge className="bg-purple-500">Campus</Badge>;
      case 'networking':
        return <Badge className="bg-orange-500">Networking</Badge>;
      case 'social':
        return <Badge className="bg-pink-500">Social</Badge>;
      default:
        return <Badge>Event</Badge>;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         (event.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
                         event.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (event.organizer && event.organizer.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = categoryFilter === 'all' || event.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });
  
  const filteredSavedEvents = events.filter(event => event.saved);

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header />
      
      <main className="container py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">University Events</h1>
          <Button onClick={() => setOpenCreateDialog(true)}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </div>
        
        <div className="mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search events by title, description, location, or organizer"
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="w-full md:w-48">
                  <Select 
                    value={categoryFilter} 
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="academic">Academic</SelectItem>
                        <SelectItem value="career">Career</SelectItem>
                        <SelectItem value="campus">Campus</SelectItem>
                        <SelectItem value="networking">Networking</SelectItem>
                        <SelectItem value="social">Social</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="upcoming">Upcoming Events</TabsTrigger>
            <TabsTrigger value="saved">Saved Events</TabsTrigger>
            <TabsTrigger value="past">Past Events</TabsTrigger>
          </TabsList>
          
          <TabsContent value="upcoming">
            {isLoading ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">Loading events...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map(event => (
                    <Card key={event.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                      {event.image_url && (
                        <div className="h-40 overflow-hidden">
                          <img src={event.image_url} alt={event.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-lg">{event.title}</CardTitle>
                          {getEventCategoryBadge(event.category)}
                        </div>
                        {event.organizer && (
                          <CardDescription>Organized by: {event.organizer}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                          {formatEventDate(event.date)}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                          {event.location}
                        </div>
                        
                        <p className="text-sm">{event.description}</p>
                      </CardContent>
                      <CardFooter className="flex space-x-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Calendar className="h-4 w-4 mr-1" />
                          Add to Calendar
                        </Button>
                        <Button 
                          size="sm" 
                          variant={event.saved ? "default" : "outline"} 
                          className={event.saved ? "flex-1 bg-blue-500 hover:bg-blue-600" : "flex-1"}
                          onClick={() => handleSaveEvent(event.id, !!event.saved)}
                        >
                          {event.saved ? "Saved" : "Save"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 bg-white rounded-lg shadow">
                    <p className="text-gray-500">No events found matching your criteria.</p>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="saved">
            {isLoading ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">Loading saved events...</p>
              </div>
            ) : filteredSavedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSavedEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden transition-shadow hover:shadow-lg">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        {getEventCategoryBadge(event.category)}
                      </div>
                      {event.organizer && (
                        <CardDescription>Organized by: {event.organizer}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        {formatEventDate(event.date)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        {event.location}
                      </div>
                      
                      <p className="text-sm">{event.description}</p>
                    </CardContent>
                    <CardFooter className="flex space-x-2 pt-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Calendar className="h-4 w-4 mr-1" />
                        Add to Calendar
                      </Button>
                      <Button 
                        size="sm" 
                        variant="default"
                        className="flex-1 bg-red-500 hover:bg-red-600"
                        onClick={() => handleSaveEvent(event.id, true)}
                      >
                        Unsave
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 mb-4">You haven't saved any events yet.</p>
                <Button variant="outline" onClick={() => {
                  const element = document.querySelector('[data-value="upcoming"]');
                  if (element) {
                    (element as HTMLElement).click();
                  }
                }}>
                  Explore Events
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="past">
            {isLoading ? (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500">Loading past events...</p>
              </div>
            ) : pastEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastEvents.map(event => (
                  <Card key={event.id} className="overflow-hidden transition-shadow hover:shadow-lg opacity-75">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-lg">{event.title}</CardTitle>
                        {getEventCategoryBadge(event.category)}
                      </div>
                      {event.organizer && (
                        <CardDescription>Organized by: {event.organizer}</CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                        {formatEventDate(event.date)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                        {event.location}
                      </div>
                      
                      <p className="text-sm">{event.description}</p>
                      
                      <Badge variant="outline" className="bg-gray-200">Event Ended</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-white rounded-lg shadow">
                <p className="text-gray-500 mb-4">No past events to display.</p>
                <Button variant="outline" onClick={() => {
                  const element = document.querySelector('[data-value="upcoming"]');
                  if (element) {
                    (element as HTMLElement).click();
                  }
                }}>
                  View Upcoming Events
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      
      {/* Create Event Dialog */}
      <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
            <DialogDescription>
              Fill out the form below to create a new event. All fields marked with * are required.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-title" className="text-right">
                Title *
              </Label>
              <Input
                id="event-title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-date" className="text-right">
                Date *
              </Label>
              <div className="col-span-3">
                <Input
                  id="event-date"
                  type="date"
                  value={newEvent.date}
                  onChange={(e) => setNewEvent({...newEvent, date: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-time" className="text-right">
                Time
              </Label>
              <div className="col-span-3">
                <Input
                  id="event-time"
                  type="time"
                  value={newEvent.time}
                  onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-location" className="text-right">
                Location *
              </Label>
              <Input
                id="event-location"
                value={newEvent.location}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-category" className="text-right">
                Category *
              </Label>
              <Select
                value={newEvent.category}
                onValueChange={(value) => setNewEvent({...newEvent, category: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="academic">Academic</SelectItem>
                  <SelectItem value="career">Career</SelectItem>
                  <SelectItem value="campus">Campus</SelectItem>
                  <SelectItem value="networking">Networking</SelectItem>
                  <SelectItem value="social">Social</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="event-description" className="text-right">
                Description
              </Label>
              <Textarea
                id="event-description"
                value={newEvent.description}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
                className="col-span-3"
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenCreateDialog(false)}>Cancel</Button>
            <Button type="submit" onClick={handleCreateEvent}>Create Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Events;
